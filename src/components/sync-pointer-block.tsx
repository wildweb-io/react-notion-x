import React, { FC } from 'react'

import {
  SyncPointerBlock as SyncPointerBlockType
} from 'notion-types'

import { NotionBlockRenderer } from '../renderer'
import { IBlock } from '../types'

export const SyncPointerBlock: FC<{
  block: IBlock
  level: number
}> = ({ block, level }) => {
  if (!block) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('missing sync pointer block', block.id)
    }

    return null
  }

  const syncPointerBlock = block as SyncPointerBlockType
  const referencePointerId =
    syncPointerBlock?.format?.transclusion_reference_pointer?.id

  if (!referencePointerId) {
    return null
  }

  return (
    <NotionBlockRenderer
      key={referencePointerId}
      level={level}
      blockId={referencePointerId}
    />
  )
}
