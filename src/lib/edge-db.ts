import { connect } from '@planetscale/database';

// ✅ Use Planetscale HTTP connection for Edge-compatible middleware
const config = {
  host: process.env.DB_HOST, // Example: "aws.connect.psdb.cloud"
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export const edgeDb = connect(config);
