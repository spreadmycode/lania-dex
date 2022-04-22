import assert from '@/functions/assert'
import { PublicKeyish, Spl } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

import useWallet from '../wallet/useWallet'
import { TransactionPiecesCollector } from './createTransaction'

export default async function createAssociatedTokenAccountIfNotExist(payload: {
  collector: TransactionPiecesCollector
  mint: PublicKeyish
}): Promise<PublicKey> {
  const mint = new PublicKey(payload.mint)
  const { owner, whetherTokenAccountIsExist, findTokenAccount } = useWallet.getState()
  assert(owner, 'user not connected')
  const tokenAccountAddress = findTokenAccount(mint)?.publicKey
  if (whetherTokenAccountIsExist(mint) && tokenAccountAddress) {
    return tokenAccountAddress
  }

  const ataAddress = await Spl.getAssociatedTokenAccount({ mint, owner })

  const instruction = await Spl.makeCreateAssociatedTokenAccountInstruction({
    mint,
    associatedAccount: ataAddress,
    owner,
    payer: owner
  })
  // add this instruction
  payload.collector.addInstruction(instruction)

  return ataAddress
}
