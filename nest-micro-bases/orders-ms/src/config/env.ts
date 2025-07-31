import 'dotenv/config';
import * as Joi from 'joi';

interface EnvVars {
  PORT: number;
}

const envsSchema = Joi.object<EnvVars>({
  PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = envsSchema.validate(process.env) as {
  error: Joi.ValidationError | undefined;
  value: EnvVars;
};

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
};
