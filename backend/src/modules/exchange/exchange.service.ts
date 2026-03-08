import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { ExchangeCache } from './interfaces/exchange-cache.interface';
import { AwesomeApiResponse } from './interfaces/awesome-api-response.interface';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeService.name);
  private cache: ExchangeCache | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Busca a cotação imediatamente ao subir o módulo,
   * garantindo que o cache nunca esteja vazio no primeiro request.
   */
  public async onModuleInit() {
    await this.refreshRate();
  }

  /**
   * Atualiza o cache a cada 30 segundos.
   * O frontend faz polling em GET /exchange — ele sempre lê do cache,
   * nunca espera a API externa responder.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  public async refreshRate() {
    try {
      const baseUrl = this.configService.getOrThrow<string>('EXCHANGE_API_URL');
      const apiKey = this.configService.get<string>('EXCHANGE_API_KEY');
      const url = apiKey ? `${baseUrl}?token=${apiKey}` : baseUrl;

      const response = await firstValueFrom(
        this.httpService.get<AwesomeApiResponse>(url),
      );

      const bid = parseFloat(response.data.USDBRL.bid);

      if (isNaN(bid) || bid <= 0) {
        throw new Error(
          `Taxa inválida recebida da API: ${response.data.USDBRL.bid}`,
        );
      }

      this.cache = {
        rate: bid,
        fetchedAt: new Date(),
      };

      // this.logger.log(`Cotação atualizada: 1 USD = ${bid} BRL`);
    } catch (error) {
      /**
       * Loga o erro mas não derruba o cache anterior.
       * Se a API externa estiver fora, o sistema continua
       * servindo a última cotação conhecida.
       */
      this.logger.error('Falha ao atualizar cotação', error);
    }
  }

  // ─── Query pública (Controller) ────────────────────────────────────────────────────────

  public getRate(): ExchangeRateResponseDto {
    if (!this.cache) {
      /**
       * Só acontece se o onModuleInit falhou E nenhum cron rodou ainda.
       */
      throw new ServiceUnavailableException(
        'Cotação ainda não disponível. Tente novamente em instantes.',
      );
    }

    return {
      from: 'USD',
      to: 'BRL',
      rate: this.cache.rate,
      fetchedAt: this.cache.fetchedAt,
    };
  }
}
