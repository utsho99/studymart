import { useState, useEffect } from 'react'

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    if (isStandalone()) return // already installed, don't show anything
    if (localStorage.getItem('sm_install_dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS doesn't fire beforeinstallprompt - show our own banner after a delay
    if (isIOS()) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSModal(true)
      return
    }
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('sm_install_dismissed', '1')
  }

  if (!showBanner) return null

  return (
    <>
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-40 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="StudyMart" className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Install StudyMart</p>
            <p className="text-xs text-gray-500 mt-0.5">Add to your home screen for quick access, just like an app.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={dismiss} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Not now</button>
              <button onClick={handleInstall} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors">
                Install
              </button>
            </div>
          </div>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* iOS instructions modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowIOSModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 mb-4">Install StudyMart on iPhone</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <p className="text-sm text-gray-700">Tap the <strong>Share</strong> button
                  <svg className="w-4 h-4 inline mx-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  at the bottom of Safari</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <p className="text-sm text-gray-700">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <p className="text-sm text-gray-700">Tap <strong>"Add"</strong> in the top right corner</p>
              </div>
            </div>
            <button onClick={() => setShowIOSModal(false)} className="w-full btn-primary mt-5">Got it</button>
          </div>
        </div>
      )}
    </>
  )
}
