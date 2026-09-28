import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex items-center justify-center min-h-screen bg-[#F5F4F9]'>
          <div className='bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center'>
            <div className='text-red-500 text-5xl mb-4'>!</div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Something went wrong</h2>
            <p className='text-gray-600 text-sm mb-6'>
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className='bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition'
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
