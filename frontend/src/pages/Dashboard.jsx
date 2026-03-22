import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper, Card, Avatar, Btn, Skeleton, EmptyState, StatusBadge } from '../components/UI'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import FriendCard from '../components/FriendCard'
import { postAPI, userAPI, friendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [pendingReqs, setPendingReqs] = useState([])
  const [friends, setFriends] = useState([])

  const loadFeed = useCallback(async (p=1, append=false) => {
    if (p===1) setLoadingFeed(true)
    try {
      const r = await postAPI.getFeed(p)
      const newPosts = r.data.posts || []
      setPosts(prev => append ? [...prev,...newPosts] : newPosts)
      setHasMore(newPosts.length===10)
    } catch {}
    setLoadingFeed(false)
  },[])

  useEffect(() => {
    loadFeed(1)
    userAPI.discover({page:1}).then(r=>setSuggestions((r.data.users||[]).slice(0,4))).catch(()=>{})
    friendAPI.getReceived().then(r=>setPendingReqs(r.data.requests||[])).catch(()=>{})
    friendAPI.getFriends().then(r=>setFriends((r.data.friends||[]).slice(0,6))).catch(()=>{})
  },[loadFeed])

  return (
    <PageWrapper className="lg:pl-20 xl:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {user?.account_status==='pending' && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div><p className="text-amber-400 font-semibold text-sm">Account Pending Review</p><p className="text-amber-400/70 text-xs">Our team is verifying your documents. Full access coming soon!</p></div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">
            <Card className="p-5">
              <div className="flex flex-col items-center text-center">
                <Avatar src={user?.profile_picture} name={user?.full_name||''} size="xl" online className="mb-3" />
                <Link to="/profile" className="font-bold text-slate-100 hover:text-primary-400 transition-colors">{user?.full_name}</Link>
                <p className="text-xs text-slate-500 mb-2">@{user?.username}</p>
                <StatusBadge status={user?.account_status} />
              </div>
            </Card>
            {friends.length>0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Friends Online</h3>
                  <Link to="/friends" className="text-xs text-primary-400">See all</Link>
                </div>
                {friends.map(f=>(
                  <Link key={f.user_id} to={`/chat/${f.user_id}`} className="flex items-center gap-2 p-2 rounded-xl hover:bg-primary-500/5 transition-colors group">
                    <Avatar src={f.profile_picture} name={f.full_name} size="sm" online={!!f.is_online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-primary-400 transition-colors">{f.full_name}</p>
                      <p className="text-xs text-slate-600">{f.is_online?'🟢 Online':'⚫ Offline'}</p>
                    </div>
                  </Link>
                ))}
              </Card>
            )}
            <Card className="p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h3>
              {[['🌐 Discover Friends','/discover'],['💬 Messages','/chat'],['🎉 Events','/events'],['🗺️ Friend Map','/map']].map(([l,to])=>(
                <Link key={to} to={to} className="flex items-center gap-2 py-2 text-sm text-slate-500 hover:text-primary-400 transition-colors border-b border-primary-500/5 last:border-0">{l}</Link>
              ))}
            </Card>
          </div>
          {/* Feed */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {user?.account_status==='verified' && <CreatePost onCreated={p=>setPosts(prev=>[p,...prev])} />}
            {pendingReqs.length>0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-sm">Friend Requests ({pendingReqs.length})</h3>
                  <Link to="/friends" className="text-xs text-primary-400">View all</Link>
                </div>
                {pendingReqs.slice(0,2).map(req=>(
                  <div key={req.request_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-500/5">
                    <Avatar src={req.profile_picture} name={req.full_name} size="sm" online={!!req.is_online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{req.full_name}</p>
                      <p className="text-xs text-slate-500">{req.flag_emoji} {req.country_name}</p>
                    </div>
                    <Link to="/friends"><Btn size="sm">Respond</Btn></Link>
                  </div>
                ))}
              </Card>
            )}
            {loadingFeed ? (
              <div className="flex flex-col gap-4">
                {[1,2].map(i=>(
                  <Card key={i} className="p-4">
                    <div className="flex gap-3 mb-4"><Skeleton className="w-11 h-11 rounded-full flex-shrink-0"/><div className="flex-1"><Skeleton className="h-4 w-1/3 mb-2"/><Skeleton className="h-3 w-1/4"/></div></div>
                    <Skeleton className="h-20 w-full mb-3"/><Skeleton className="h-3 w-1/3"/>
                  </Card>
                ))}
              </div>
            ) : posts.length===0 ? (
              <EmptyState icon="🌍" title="Your feed is empty" description="Add friends or discover people to see posts here!"
                action={<Link to="/discover"><Btn>Discover Friends →</Btn></Link>} />
            ) : (
              <>
                {posts.map((post,i)=>(
                  <motion.div key={post.post_id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <PostCard post={post} onDelete={id=>setPosts(p=>p.filter(x=>x.post_id!==id))} />
                  </motion.div>
                ))}
                {hasMore && <div className="text-center pt-2"><Btn variant="secondary" onClick={()=>{const next=page+1;setPage(next);loadFeed(next,true)}}>Load More</Btn></div>}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
