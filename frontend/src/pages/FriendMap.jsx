import { useState, useEffect } from 'react'
import { PageWrapper, Card, Avatar, Btn, EmptyState } from '../components/UI'
import Navbar from '../components/Navbar'
import { friendAPI } from '../services/api'
import { Link } from 'react-router-dom'

// Country coordinates lookup (simplified)
const countryCoords = {
  BD:[23.685,90.356], US:[37.09,-95.712], GB:[55.378,-3.436], IN:[20.593,78.963],
  CA:[56.130,-106.347], AU:[-25.274,133.776], DE:[51.165,10.452], FR:[46.227,2.213],
  JP:[36.204,138.253], BR:[-14.235,-51.925], KR:[35.907,127.767], NG:[9.082,8.676],
  ZA:[-30.560,22.938], MX:[23.635,-102.553], IT:[41.872,12.567], ES:[40.463,-3.749],
  PK:[30.375,69.345], CN:[35.861,104.195], ID:[-0.789,113.921], TR:[38.964,35.243],
  EG:[26.820,30.802], AR:[-38.416,-63.617], PL:[51.920,19.145], NL:[52.133,5.291],
  SE:[60.128,18.644], NO:[60.472,8.469], DK:[56.263,9.502], PT:[39.400,-8.225],
  GR:[39.074,21.825], TH:[15.870,100.993], VN:[14.059,108.277], MY:[4.211,101.976],
  PH:[12.880,121.774], SG:[1.353,103.820], AE:[23.424,53.848], SA:[23.886,45.079],
  KE:[-0.023,37.906], GH:[7.946,-1.023], NZ:[-40.901,174.886], IE:[53.412,-8.244],
  CH:[46.818,8.228], RU:[61.524,105.318], UA:[48.380,31.166], CO:[4.571,-74.298],
}

const continentColors = { Asia: '#f59e0b', Europe: '#3b9eff', Americas: '#22c55e', Africa: '#f97316', Oceania: '#a855f7' }

export default function FriendMap() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [LeafletMap, setLeafletMap] = useState(null)
  const [MapReady, setMapReady] = useState(false)

  useEffect(() => {
    friendAPI.getFriends()
      .then(r => setFriends(r.data.friends || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Dynamically import leaflet components
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([rl, L]) => {
      setLeafletMap({ rl, L })
      setMapReady(true)
    }).catch(() => {})
  }, [])

  // Group by country
  const byCountry = friends.reduce((acc, f) => {
    const key = f.country_name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {})

  if (loading) return (
    <PageWrapper>
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 pt-20 lg:pt-8 pb-24 lg:pb-8 flex flex-col flex-1">
          {/* Header */}
          <div className="mb-4">
            <h1 className="font-black text-2xl text-white font-display">Friend Map 🗺️</h1>
            <p className="text-slate-500 text-sm mt-1">{friends.length} friends across {Object.keys(byCountry).length} countries</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            {/* Sidebar */}
            <div className="lg:w-72 xl:w-80 shrink-0 space-y-3 order-2 lg:order-1">
              <div className="glass rounded-2xl border border-primary-500/15 p-4 max-h-[60vh] lg:max-h-full overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Friends by Country</h3>
                {Object.keys(byCountry).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">🌍</div>
                    <p className="text-xs text-slate-600">Add friends to see them on the map!</p>
                    <Link to="/discover" className="mt-3 block">
                      <Btn size="sm" variant="ghost">Discover →</Btn>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byCountry).sort((a,b) => b[1].length - a[1].length).map(([country, members]) => (
                      <div key={country} className="border-b border-primary-500/5 pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-slate-300">{members[0]?.flag_emoji} {country}</p>
                          <span className="text-xs bg-primary-500/15 text-primary-400 px-2 py-0.5 rounded-full font-bold">{members.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {members.slice(0, 4).map(f => (
                            <Link key={f.user_id} to={`/profile/${f.user_id}`}>
                              <Avatar src={f.profile_picture} name={f.full_name} size="xs" online={!!f.is_online} />
                            </Link>
                          ))}
                          {members.length > 4 && <span className="text-xs text-slate-600 self-center">+{members.length - 4}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <Card className="p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</h3>
                {Object.entries(continentColors).map(([cont, color]) => (
                  <div key={cont} className="flex items-center gap-2 mb-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-500">{cont}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Map */}
            <div className="flex-1 order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden border border-primary-500/15 bg-dark-400" style={{ height: '500px' }}>
                {MapReady && LeafletMap ? (
                  <MapComponent friends={friends} LeafletMap={LeafletMap} countryCoords={countryCoords} continentColors={continentColors} byCountry={byCountry} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="text-5xl">🗺️</div>
                    <p className="text-slate-400 font-semibold">Loading map…</p>
                    <p className="text-xs text-slate-600">Make sure you're connected to the internet</p>
                    {/* Fallback: show list */}
                    <div className="mt-4 w-full max-w-sm px-6">
                      {friends.slice(0, 6).map(f => (
                        <div key={f.user_id} className="flex items-center gap-3 py-2 border-b border-primary-500/10">
                          <Avatar src={f.profile_picture} name={f.full_name} size="sm" online={!!f.is_online} />
                          <div>
                            <p className="text-sm text-slate-200">{f.full_name}</p>
                            <p className="text-xs text-slate-600">{f.flag_emoji} {f.country_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function MapComponent({ friends, LeafletMap, countryCoords, continentColors, byCountry }) {
  const { MapContainer, TileLayer, CircleMarker, Popup } = LeafletMap.rl
  const L = LeafletMap.L

  const getCoords = (friend) => {
    // Try to get coords from country code
    const iso = friend.iso_code
    if (iso && countryCoords[iso]) return countryCoords[iso]
    // Fallback by country name
    const entry = Object.entries(countryCoords).find(([k]) => k === iso)
    return entry ? entry[1] : null
  }

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom className="rounded-2xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {Object.entries(byCountry).map(([country, members]) => {
        const member = members[0]
        const coords = getCoords(member)
        if (!coords) return null
        const color = continentColors[member.continent] || '#3b9eff'
        return (
          <CircleMarker key={country} center={coords} radius={8 + Math.min(members.length * 3, 16)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
                <p style={{ fontWeight: 700, marginBottom: 8 }}>{member.flag_emoji} {country}</p>
                {members.slice(0, 4).map(f => (
                  <div key={f.user_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden' }}>
                      {f.profile_picture
                        ? <img src={`/api/uploads/posts/${f.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                        : f.full_name[0]
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 12 }}>{f.full_name}</p>
                      <p style={{ color: '#6b7c93', fontSize: 11 }}>{f.is_online ? '● Online' : 'Offline'}</p>
                    </div>
                  </div>
                ))}
                {members.length > 4 && <p style={{ fontSize: 11, color: '#6b7c93' }}>+{members.length - 4} more friends</p>}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
