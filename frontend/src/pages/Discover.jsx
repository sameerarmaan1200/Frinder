import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, Btn, Input, Select, Skeleton, EmptyState } from '../components/UI'
import Navbar from '../components/Navbar'
import FriendCard from '../components/FriendCard'
import { userAPI, lookupAPI } from '../services/api'

const container = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} }
const item = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} }

export default function Discover() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [lookup, setLookup]     = useState({countries:[],interests:[],languages:[]})
  const [filters, setFilters]   = useState({ search:'', country_id:'', interest_id:'', language_id:'', min_age:'', max_age:'', continent:'' })

  useEffect(()=>{ lookupAPI.all().then(r=>setLookup(r.data)).catch(()=>{}) },[])

  const load = useCallback(async (f=filters, p=1) => {
    setLoading(true)
    try {
      const params = {...f, page:p}
      Object.keys(params).forEach(k=>{ if(!params[k]) delete params[k] })
      const r = await userAPI.discover(params)
      setUsers(r.data.users||[]); setTotal(r.data.total||0); setPages(r.data.pages||1); setPage(p)
    } catch {}
    setLoading(false)
  },[filters])

  useEffect(()=>{ load(filters,1) },[])

  const setF = (k,v) => setFilters(f=>({...f,[k]:v}))
  const handleSearch = e => { e.preventDefault(); load(filters,1) }
  const reset = () => { const f={search:'',country_id:'',interest_id:'',language_id:'',min_age:'',max_age:'',continent:''}; setFilters(f); load(f,1) }

  const continents = ['Asia','Europe','Americas','Africa','Oceania']

  return (
    <PageWrapper className="lg:pl-20 xl:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black font-display text-2xl text-white">Discover Friends 🌍</h1>
            <p className="text-sm text-slate-500">{total} verified members worldwide</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="glass rounded-2xl border border-primary-500/15 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input value={filters.search} onChange={e=>setF('search',e.target.value)} placeholder="Search by name, country, interests…" icon="🔍" className="flex-1" />
            <Btn type="submit">Search</Btn>
            <Btn type="button" variant="ghost" onClick={reset}>Reset</Btn>
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <Select value={filters.country_id} onChange={e=>{setF('country_id',e.target.value);load({...filters,country_id:e.target.value},1)}}>
              <option value="">All Countries</option>
              {lookup.countries.map(c=><option key={c.country_id} value={c.country_id}>{c.flag_emoji} {c.country_name}</option>)}
            </Select>
            <Select value={filters.continent} onChange={e=>{setF('continent',e.target.value);load({...filters,continent:e.target.value},1)}}>
              <option value="">All Continents</option>
              {continents.map(c=><option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={filters.interest_id} onChange={e=>{setF('interest_id',e.target.value);load({...filters,interest_id:e.target.value},1)}}>
              <option value="">All Interests</option>
              {lookup.interests.map(i=><option key={i.interest_id} value={i.interest_id}>{i.icon} {i.interest_name}</option>)}
            </Select>
            <Select value={filters.language_id} onChange={e=>{setF('language_id',e.target.value);load({...filters,language_id:e.target.value},1)}}>
              <option value="">All Languages</option>
              {lookup.languages.map(l=><option key={l.language_id} value={l.language_id}>{l.language_name}</option>)}
            </Select>
            <div className="flex gap-1">
              <Input value={filters.min_age} onChange={e=>setF('min_age',e.target.value)} placeholder="Min age" type="number" className="w-20" />
              <Input value={filters.max_age} onChange={e=>setF('max_age',e.target.value)} placeholder="Max" type="number" className="w-20" />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className="rounded-2xl border border-primary-500/10 bg-dark-300/80 p-4">
                <div className="flex gap-3 mb-3"><Skeleton className="w-14 h-14 rounded-full flex-shrink-0"/><div className="flex-1"><Skeleton className="h-4 w-2/3 mb-2"/><Skeleton className="h-3 w-1/2 mb-1"/><Skeleton className="h-3 w-1/3"/></div></div>
                <Skeleton className="h-8 w-full mb-3"/><div className="flex gap-1"><Skeleton className="h-6 w-16 rounded-full"/><Skeleton className="h-6 w-16 rounded-full"/></div>
              </div>
            ))}
          </div>
        ) : users.length===0 ? (
          <EmptyState icon="🌐" title="No users found" description="Try adjusting your filters or search term" action={<Btn onClick={reset}>Clear Filters</Btn>} />
        ) : (
          <>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {users.map(u=>(
                <motion.div key={u.user_id} variants={item}>
                  <FriendCard user={u} />
                </motion.div>
              ))}
            </motion.div>
            {pages>1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Btn variant="ghost" onClick={()=>load(filters,page-1)} disabled={page===1}>← Prev</Btn>
                <span className="text-sm text-slate-500">Page {page} of {pages}</span>
                <Btn variant="ghost" onClick={()=>load(filters,page+1)} disabled={page===pages}>Next →</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
