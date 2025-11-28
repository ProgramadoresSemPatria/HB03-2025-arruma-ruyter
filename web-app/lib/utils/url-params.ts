export function getInstallationIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('installation_id')
}

export function getUrlParam(param: string): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

export function addUrlParam(key: string, value: string): string {
  if (typeof window === 'undefined') return ''
  
  const url = new URL(window.location.href)
  url.searchParams.set(key, value)
  return url.toString()
}

export function removeUrlParam(key: string): string {
  if (typeof window === 'undefined') return ''
  
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  return url.toString()
}

