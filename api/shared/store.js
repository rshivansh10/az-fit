const { CosmosClient } = require('@azure/cosmos')
const crypto = require('crypto')

let cachedContainer = null

function getContainer() {
  if (cachedContainer) {
    return cachedContainer
  }

  const endpoint = process.env.COSMOS_ENDPOINT
  const key = process.env.COSMOS_PRIMARY_KEY
  const databaseId = process.env.COSMOS_DATABASE_ID
  const containerId = process.env.COSMOS_CONTAINER_ID

  if (!endpoint || !key || !databaseId || !containerId) {
    throw new Error(
      'Cosmos DB config missing. Set COSMOS_ENDPOINT, COSMOS_PRIMARY_KEY, COSMOS_DATABASE_ID, COSMOS_CONTAINER_ID.'
    )
  }

  const client = new CosmosClient({ endpoint, key })
  cachedContainer = client.database(databaseId).container(containerId)
  return cachedContainer
}

function buildId(prefix, email) {
  return `${prefix}_${email.replace('@', '_at_').replace('.', '_')}`
}

async function upsertUser(email, passwordHash) {
  const container = getContainer()
  const doc = {
    id: buildId('user', email),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    docType: 'user'
  }

  await container.items.upsert(doc)
  return doc
}

async function getUser(email) {
  const container = getContainer()

  try {
    const { resource } = await container.item(buildId('user', email), email).read()
    if (!resource || resource.docType !== 'user') {
      return null
    }
    return resource
  } catch (error) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

async function upsertProfile(email, profile) {
  const container = getContainer()
  const doc = {
    id: buildId('profile', email),
    email,
    ...profile,
    updatedAt: new Date().toISOString(),
    docType: 'profile'
  }

  await container.items.upsert(doc)
  return doc
}

async function getProfile(email) {
  const container = getContainer()

  try {
    const { resource } = await container.item(buildId('profile', email), email).read()
    if (!resource || resource.docType !== 'profile') {
      return null
    }
    return resource
  } catch (error) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

async function addWorkout(email, workout) {
  const container = getContainer()
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email,
    createdAt: new Date().toISOString(),
    docType: 'workout',
    ...workout
  }

  await container.items.create(entry)
  return entry
}

async function getRecentWorkouts(email, limit = 5) {
  const container = getContainer()
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(50, Math.floor(limit))) : 5

  const querySpec = {
    query: `SELECT * FROM c WHERE c.email = @email AND c.docType = @docType ORDER BY c.createdAt DESC OFFSET 0 LIMIT ${safeLimit}`,
    parameters: [
      { name: '@email', value: email },
      { name: '@docType', value: 'workout' }
    ]
  }

  const { resources } = await container.items.query(querySpec, { partitionKey: email }).fetchAll()
  return resources
}

module.exports = {
  upsertUser,
  getUser,
  upsertProfile,
  getProfile,
  addWorkout,
  getRecentWorkouts
}
