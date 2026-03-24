import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function useAuthPrompt() {
    const [show, setShow] = useState(false)
    const [feature, setFeature] = useState('')

    const prompt = (featureName = 'this feature') => {
        setFeature(featureName)
        setShow(true)
    }

    const AuthPromptModal = () => (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4"
                    onClick={() => setShow(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-sm glass rounded-3xl border border-primary-500/25 shadow-glow-lg overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600" />
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center text-3xl mx-auto mb-5">
                                🔐
                            </div>
                            <h2 className="font-black font-display text-xl text-white mb-2">
                                Account Required
                            </h2>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                You need a free Frinder account to use{' '}
                                <span className="text-primary-400 font-semibold">{feature}</span>.
                            </p>
                            <div className="grid grid-cols-2 gap-2 mb-6 text-left">
                                {[
                                    ['💬', 'Send Messages'], ['❤️', 'Like Posts'],
                                    ['🤝', 'Add Friends'], ['💬', 'Comment'],
                                    ['🎉', 'Join Events'], ['🗺️', 'Friend Map'],
                                ].map(([icon, label]) => (
                                    <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="text-sm">{icon}</span> {label}
                                    </div>
                                ))}
                            </div>
                            <Link to="/register"
                                className="block w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all shadow-glow-sm hover:shadow-glow-md mb-3"
                                onClick={() => setShow(false)}
                            >
                                Create Free Account →
                            </Link>
                            <Link to="/login"
                                className="block w-full py-2.5 rounded-xl border border-primary-500/25 text-slate-300 hover:text-white font-semibold text-sm transition-all"
                                onClick={() => setShow(false)}
                            >
                                Already have an account? Sign In
                            </Link>
                            <button onClick={() => setShow(false)} className="mt-4 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                                Continue browsing as guest
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return { prompt, AuthPromptModal }
}