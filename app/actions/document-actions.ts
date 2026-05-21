interface DocumentsDelegate {
  update(args: {
    where: { id: string }
    data: { relatedDocuments: string[] | { push: string } }
  }): Promise<unknown>
  findUnique(args: {
    where: { id: string }
    select: { relatedDocuments: true }
  }): Promise<{ relatedDocuments: string[] } | null>
}

export async function addDocument(
  model: DocumentsDelegate,
  id: string,
  key: string
) {
  try {
    await model.update({
      where: { id },
      data: { relatedDocuments: { push: key } }
    })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to add document')
  }
}

export async function removeDocument(
  model: DocumentsDelegate,
  id: string,
  key: string
) {
  try {
    const entity = await model.findUnique({
      where: { id },
      select: { relatedDocuments: true }
    })
    if (!entity) return
    await model.update({
      where: { id },
      data: {
        relatedDocuments: entity.relatedDocuments.filter(k => k !== key)
      }
    })
  }
  catch (e) {
    console.error(e)
    throw new Error(
      e instanceof Error ? e.message : 'Failed to remove document'
    )
  }
}
