"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { setUserEmail } = useUser()

  // API 설정
  const LOGIN_API_BASE = "http://localhost:8080"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      alert("이메일과 비밀번호를 입력해주세요.")
      return
    }

    if (isSignUp) {
      // 회원가입 처리
      if (formData.password !== formData.confirmPassword) {
        alert("비밀번호가 일치하지 않습니다!")
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(`${LOGIN_API_BASE}/api/v1/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          if (response.status === 400 || response.status === 409) {
            // 서버에서 반환하는 에러 메시지 파싱
            try {
              const errorData = await response.json()
              alert(errorData.message || "이미 사용 중인 이메일입니다.")
            } catch {
              alert("이미 사용 중인 이메일입니다.")
            }
          } else {
            throw new Error(`회원가입 요청 실패: ${response.status} ${response.statusText}`)
          }
          return
        }

        const data = await response.json()
        
        // 회원가입 성공
        alert(`회원가입이 완료되었습니다!`)
        
        // 로그인 모드로 전환
        setIsSignUp(false)
        setFormData({
          email: formData.email, // 이메일은 유지
          password: "",
          confirmPassword: "",
        })
        
      } catch (error) {
        console.error("회원가입 오류:", error)
        alert("회원가입에 실패하였습니다.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    // 로그인 처리
    setIsLoading(true)

    try {
      const response = await fetch(`${LOGIN_API_BASE}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        throw new Error(`로그인 요청 실패: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.valid) {
        // 로그인 성공
        setUserEmail(formData.email)
        router.push('/dashboard')
      } else {
        // 로그인 실패
        alert("로그인에 실패하였습니다.")
      }
    } catch (error) {
      console.error("로그인 오류:", error)
      alert("로그인에 실패하였습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <MessageSquare className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Certified Messaging</h1>
          <p className="text-muted-foreground mt-2 font-mono">Secure corporate communication platform</p>
        </div>

        {/* Login/Signup Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-sans">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </CardTitle>
            <CardDescription className="font-mono">
              {isSignUp
                ? "Fill in your details to create a new account"
                : "Enter your credentials to access the messaging platform"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="font-mono pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-sans">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="font-mono pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full font-sans" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating..." : "Signing In..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            {/* Links Section */}
            <div className="mt-6 space-y-4">
              {!isSignUp && (
                <div className="flex justify-between text-sm">
                  <Link
                    href="/forgot-id"
                    className="text-accent hover:text-accent/80 font-mono underline-offset-4 hover:underline"
                  >
                    Forgot ID?
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="text-accent hover:text-accent/80 font-mono underline-offset-4 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full font-sans bg-transparent"
                  onClick={toggleMode}
                  type="button"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
