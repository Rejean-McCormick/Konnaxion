// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\CreateForm\index.tsx
'use client'

/**
 * Description: Sculpture create page component
 * Author: Hieu Chu
 */

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import SculptureCreate from './SculptureCreate'
import SculptureUploadImage from './SculptureUploadImage'

type MinimalSculpture = { accessionId: string; name: string }

const CreateForm = () => {
  // 1) Aligne la signature attendue par SculptureCreate: number
  const [step, setStep] = useState<number>(1)

  // 2) État local typé au plus juste pour l’upload
  const [sculpture, setSculptureState] = useState<MinimalSculpture | null>(null)

  // 3) Setter proxy pour coller à la prop attendue par SculptureCreate:
  //    Dispatch<SetStateAction<Record<string, any>>>
  const setSculpture: Dispatch<SetStateAction<Record<string, any>>> = (update) => {
    setSculptureState((prev) => {
      const base: Record<string, any> = prev ?? { accessionId: '', name: '' }
      const nextObj =
        typeof update === 'function'
          ? (update as (p: Record<string, any>) => Record<string, any>)(base)
          : update

      if (nextObj && typeof nextObj === 'object') {
        const accessionId = String(nextObj.accessionId ?? base.accessionId ?? '')
        const name = String(nextObj.name ?? base.name ?? '')
        if (accessionId && name) {
          return { accessionId, name }
        }
      }
      // Ignore une mise à jour invalide pour conserver l’état précédent
      return prev
    })
  }

  if (step === 1) {
    return <SculptureCreate setStep={setStep} setSculpture={setSculpture} />
  }

  if (step === 2) {
    // Sécurité: si `sculpture` est encore null, on n’affiche pas l’upload.
    if (!sculpture) return null
    return <SculptureUploadImage sculpture={sculpture} />
  }

  return null
}

export default CreateForm
