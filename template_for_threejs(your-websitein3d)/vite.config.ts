build: {
  rollupOptions: {
    output: {
      manualChunks: {
        three: ['three'],
        tween: ['@tweenjs/tween.js']
      }
    }
  }
}