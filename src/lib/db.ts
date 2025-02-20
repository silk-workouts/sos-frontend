import { connect } from '@planetscale/database';

const config = {
  url: process.env.DATABASE_URL,
};

export const db = connect(config);
