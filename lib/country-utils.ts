// Country code to full name and flag emoji mapping
const countryData: Record<string, { name: string; flag: string }> = {
  'US': { name: 'United States', flag: '🇺🇸' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'CA': { name: 'Canada', flag: '🇨🇦' },
  'AU': { name: 'Australia', flag: '🇦🇺' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'NL': { name: 'Netherlands', flag: '🇳🇱' },
  'BE': { name: 'Belgium', flag: '🇧🇪' },
  'CH': { name: 'Switzerland', flag: '🇨🇭' },
  'AT': { name: 'Austria', flag: '🇦🇹' },
  'SE': { name: 'Sweden', flag: '🇸🇪' },
  'NO': { name: 'Norway', flag: '🇳🇴' },
  'DK': { name: 'Denmark', flag: '🇩🇰' },
  'FI': { name: 'Finland', flag: '🇫🇮' },
  'PL': { name: 'Poland', flag: '🇵🇱' },
  'IE': { name: 'Ireland', flag: '🇮🇪' },
  'PT': { name: 'Portugal', flag: '🇵🇹' },
  'GR': { name: 'Greece', flag: '🇬🇷' },
  'CZ': { name: 'Czech Republic', flag: '🇨🇿' },
  'HU': { name: 'Hungary', flag: '🇭🇺' },
  'RO': { name: 'Romania', flag: '🇷🇴' },
  'BG': { name: 'Bulgaria', flag: '🇧🇬' },
  'HR': { name: 'Croatia', flag: '🇭🇷' },
  'SK': { name: 'Slovakia', flag: '🇸🇰' },
  'SI': { name: 'Slovenia', flag: '🇸🇮' },
  'EE': { name: 'Estonia', flag: '🇪🇪' },
  'LV': { name: 'Latvia', flag: '🇱🇻' },
  'LT': { name: 'Lithuania', flag: '🇱🇹' },
  'JP': { name: 'Japan', flag: '🇯🇵' },
  'CN': { name: 'China', flag: '🇨🇳' },
  'KR': { name: 'South Korea', flag: '🇰🇷' },
  'IN': { name: 'India', flag: '🇮🇳' },
  'SG': { name: 'Singapore', flag: '🇸🇬' },
  'MY': { name: 'Malaysia', flag: '🇲🇾' },
  'TH': { name: 'Thailand', flag: '🇹🇭' },
  'PH': { name: 'Philippines', flag: '🇵🇭' },
  'ID': { name: 'Indonesia', flag: '🇮🇩' },
  'VN': { name: 'Vietnam', flag: '🇻🇳' },
  'BR': { name: 'Brazil', flag: '🇧🇷' },
  'MX': { name: 'Mexico', flag: '🇲🇽' },
  'AR': { name: 'Argentina', flag: '🇦🇷' },
  'CL': { name: 'Chile', flag: '🇨🇱' },
  'CO': { name: 'Colombia', flag: '🇨🇴' },
  'PE': { name: 'Peru', flag: '🇵🇪' },
  'ZA': { name: 'South Africa', flag: '🇿🇦' },
  'EG': { name: 'Egypt', flag: '🇪🇬' },
  'NG': { name: 'Nigeria', flag: '🇳🇬' },
  'KE': { name: 'Kenya', flag: '🇰🇪' },
  'IL': { name: 'Israel', flag: '🇮🇱' },
  'AE': { name: 'United Arab Emirates', flag: '🇦🇪' },
  'SA': { name: 'Saudi Arabia', flag: '🇸🇦' },
  'TR': { name: 'Turkey', flag: '🇹🇷' },
  'RU': { name: 'Russia', flag: '🇷🇺' },
  'UA': { name: 'Ukraine', flag: '🇺🇦' },
  'NZ': { name: 'New Zealand', flag: '🇳🇿' },
  'IS': { name: 'Iceland', flag: '🇮🇸' },
  'IE': { name: 'Ireland', flag: '🇮🇪' },
  'LU': { name: 'Luxembourg', flag: '🇱🇺' },
  'MT': { name: 'Malta', flag: '🇲🇹' },
  'CY': { name: 'Cyprus', flag: '🇨🇾' },
}

export function getCountryInfo(countryCode: string | null | undefined): { name: string; flag: string; code: string } {
  if (!countryCode || countryCode === 'XX' || countryCode === 'Unknown') {
    return { name: 'Unknown Location', flag: '🌍', code: 'Unknown' }
  }
  
  const upperCode = countryCode.toUpperCase()
  const info = countryData[upperCode]
  
  if (info) {
    return { name: info.name, flag: info.flag, code: upperCode }
  }
  
  // If country not in our list, return code with generic flag
  return { name: upperCode, flag: '🌍', code: upperCode }
}

export function getCountryFlag(countryCode: string | null | undefined): string {
  return getCountryInfo(countryCode).flag
}

export function getCountryName(countryCode: string | null | undefined): string {
  return getCountryInfo(countryCode).name
}
