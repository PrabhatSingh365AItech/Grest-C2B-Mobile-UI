import { useEffect } from 'react'

export const usePasswordValidation = (password, onValidChange, setError) => {
  useEffect(() => {
    if (!password || password.length === 0) {
      onValidChange(false)
      setError('')
      return
    }

    if (password.length < 8) {
      onValidChange(false)
      setError('Password must be at least 8 characters')
      return
    }

    const rules = [
      { regex: /[a-z]/, message: 'Must contain lowercase letter' },
      { regex: /[A-Z]/, message: 'Must contain uppercase letter' },
      { regex: /\d/, message: 'Must contain a number' },
      { regex: /[@$!%*?&]/, message: 'Must contain a special char (@$!%*?&)' },
    ]

    for (const rule of rules) {
      if (!rule.regex.test(password)) {
        onValidChange(false)
        setError(rule.message)
        return
      }
    }

    onValidChange(true)
    setError('')
  }, [password])
}
