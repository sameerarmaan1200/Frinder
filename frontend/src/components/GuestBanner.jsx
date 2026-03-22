import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function GuestBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-primary-600/20 via-primary-500/15 to-primary-600/20 border-b border-primary-500/30 px-4 py-2.5"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-300">
                        <span className="text-primary-400 font-semibold">You're browsing as a guest.</span>
                        {' '}Create a free account to like, comment, message, and connect!
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to="/login"
                        className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-primary-500/30 hover:border-primary-500/60"
                    >
                        Sign In
                    </Link>
                    <Link to="/register"
                        className="text-xs font-bold text-white bg-primary-500 hover:bg-primary-400 transition-colors px-4 py-1.5 rounded-lg shadow-glow-sm"
                    >
                        Join Free →
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}