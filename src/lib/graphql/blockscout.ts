import { initGraphQLTada } from 'gql.tada'
import type { introspection } from './blockscout-env.js'
import request from 'graphql-request'
import { getSelectedChains } from '../../lib/chain-storage'

const graphql = initGraphQLTada<{
  introspection: introspection
}>()

const AddressesSchema = graphql(`
  query Addresses($addresses: [AddressHash!]!) {
    addresses(hashes: $addresses) {
      address: hash
      transactionsCount
      nonce
      fetchedCoinBalance
      smartContract {
        name
        partiallyVerified
        verifiedViaEthBytecodeDb
        verifiedViaSourcify
      }
    }
  }
`)

export async function getAddresses({
  addresses,
  url
}: {
  addresses: string[],
  url: string
}) {
  // Rate limiting
  addresses = addresses.slice(0, 10)

  const result = await request({
    document: AddressesSchema,
    url: `${url}api/v1/graphql/`,
    variables: {
      addresses: addresses
    },
  })

  return result.addresses
}

export async function getAddressesMultichain({
  addresses,
}: {
  addresses: string[],
}) {
  console.log('addresses', addresses)

  const chains = await getSelectedChains()

  console.log('chains', chains)

  const results = await Promise.allSettled(chains.map((c) => getAddresses({ addresses, url: c.url }).then(data => ({
    chain: c,
    data: data
  }))))

  console.log('results', results)

  const successes = results.filter((r) => r.status === 'fulfilled') as Extract<(typeof results)[number], { status: "fulfilled" }>[]

  console.log('successes', successes)

  return successes.map((s) => s.value).filter((e) => e.data.length)
}

const TransactionSchema = (txHashes: string[]) => {
  const queries = txHashes.map((hash, i) => `x${i}: transaction(hash: "${hash}") {
    hash
    status
    fromAddressHash
    toAddressHash
    blockNumber
    earliestProcessingStart
}`).join("\n")

  const schema = graphql(`
    query Transaction {
      ${queries}
    }
  `)
  return schema
}

export async function getTransactions({
  txHashes,
  url
}: {
  txHashes: string[],
  url: string
}) {
  // Rate limiting
  txHashes = txHashes.slice(0, 10)

  const result = await request({
    document: TransactionSchema(txHashes),
    url: `${url}api/v1/graphql/`,
  })

  return Object.values(result).filter(Boolean) as { hash: string, status: string, fromAddressHash: string, toAddressHash: string, blockNumber: number, earliestProcessingStart: number }[]
}

export async function getTransactionsMultichain({
  txHashes,
}: {
  txHashes: string[],
}) {
  const chains = await getSelectedChains()

  const results = await Promise.allSettled(chains.map((c) => getTransactions({ txHashes, url: c.url }).then(data => ({
    chain: c,
    data: data
  }))))
  const successes = results.filter((r) => r.status === 'fulfilled') as Extract<(typeof results)[number], { status: "fulfilled" }>[]

  return successes.map((s) => s.value).filter((e) => e.data.length)
} 