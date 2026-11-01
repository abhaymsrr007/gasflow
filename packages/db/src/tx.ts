import type { PoolClient } from 'pg';
import { appPool } from './pool';

export async function withTenantContext<T>(
  tenantId: string,
  userId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  // ↑ Ye function ek callback leta hai (ek kaam jo database mein karna hai).
  // Function transaction start karega, tenant set karega, phir callback chalayega.

  const client = await appPool.connect();
  // ↑ Pool se ek connection lo.

  try {
    await client.query('BEGIN');
    // ↑ Transaction start karo.
    // Agar beech mein koi error aaye, toh sab rollback ho jayega.

    await client.query(`SET LOCAL app.tenant_id = $1`, [tenantId]);
    // ↑ "SET LOCAL" ka matlab: sirf is transaction ke liye tenant_id set karo.
    // Transaction khatam hote hi ye reset ho jayega.
    // "SET" (bina LOCAL) nahi, kyunki wo connection par permanent lag jata hai
    // aur doosre user ka data leak ho sakta hai.

    await client.query(`SET LOCAL app.user_id = $1`, [userId]);
    // ↑ User ID bhi set karo (future ke liye).

    const result = await callback(client);
    // ↑ Ab callback chalao - jo bhi database kaam karna hai.

    await client.query('COMMIT');
    // ↑ Sab kuch theek chala, toh save karo.

    return result;
    // ↑ Callback ka result wapas do.
  } catch (error) {
    await client.query('ROLLBACK');
    // ↑ Kuch galat hua, toh sab undo karo.

    throw error;
    // ↑ Error ko aage bhejo.
  } finally {
    client.release();
    // ↑ Connection ko pool mein wapas do (chahe success ho ya error).
  }
}