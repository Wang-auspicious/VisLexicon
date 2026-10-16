// The home card wall does not need the full discovery/facet/evidence record.
// Full search/filter and detail endpoints retain all of their original fields.
const CARD_FIELDS = ['releaseId', 'revision', 'entryId', 'status', 'name', 'nameEn', 'domain', 'homepage', 'takeawayZh', 'recommendation', 'primaryCategory', 'licenses', 'licenseSourceUrl', 'checkedAt', 'shot', 'shots', 'video', 'independentlyReviewed']
export function projectSiteCard(item) {
  const card = Object.fromEntries(CARD_FIELDS.filter(key => item[key] != null).map(key => [key, item[key]]))
  card.facets = { deliverables: item.facets?.deliverables || [], contentOrganization: item.facets?.contentOrganization || [] }
  card.heat = { relations: (item.atlasRelations || item.atlasTerms || []).length, roles: item.evidenceSummary?.roles?.length || 0 }
  return card
}
