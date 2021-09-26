import { useEffect, useRef } from 'react'

const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const isNotFirstRenderRef = useRef<boolean>()

  useEffect(() => {
    if (isNotFirstRenderRef.current) {
      return effect()
    } else {
      isNotFirstRenderRef.current = true
    }
  }, deps)
}

export default useUpdateEffect
