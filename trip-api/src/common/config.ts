export default () =>
  ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    map: {
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    mq: {
      user: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
      host: process.env.RABBITMQ_HOST,
      queueName: process.env.RABBITMQ_QUEUE_NAME,
    },
  } as AppConfig);

export interface AppConfig {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  map: {
    key: string;
  };
  mq: {
    user: string;
    password: string;
    host: string;
    queueName: string;
  };
}
