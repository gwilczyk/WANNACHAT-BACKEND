import bunyan from 'bunyan';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public CLIENT_URL: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public CLOUD_NAME: string | undefined;
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public REDIS_HOST: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENDGRID_SENDER: string | undefined;

  private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/wannachatapp-backend';

  constructor() {
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET,
      cloud_name: this.CLOUD_NAME
    });
  }
}

export const config: Config = new Config();
