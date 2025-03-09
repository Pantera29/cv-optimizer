"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const { signIn, signUp, isLoading, error } = useAuth()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isLogin) {
        console.log("Iniciando login con:", email)
        const success = await signIn(email, password)
        
        if (success) {
          console.log("Login exitoso, redirigiendo...")
          setLoginSuccess(true)
          
          // Redirigir directamente a la aplicación
          window.location.href = '/app'
        }
      } else {
        console.log("Iniciando registro con:", email)
        await signUp(email, password)
        // No redirigimos en el registro, esperamos confirmación de email
        setEmail('')
        setPassword('')
        setIsLogin(true)
      }
    } catch (error) {
      console.error("Error en autenticación:", error)
      setLoginSuccess(false)
    }
  }

  return (
    <Card className="w-full shadow-md border rounded-xl overflow-hidden bg-white">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {isLogin 
            ? 'Ingresa tus credenciales para continuar' 
            : 'Crea una cuenta para comenzar'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loginSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              ¡Inicio de sesión exitoso! Redirigiendo...
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium block pb-1">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || loginSuccess}
                className="pl-10 py-6 h-12 rounded-md"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium block pb-1">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || loginSuccess}
                className="pl-10 py-6 h-12 rounded-md"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium" 
            disabled={isLoading || loginSuccess}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loginSuccess && <CheckCircle className="mr-2 h-5 w-5" />}
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6 px-6">
        {!loginSuccess && (
          <Button
            type="button"
            variant="link"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            {isLogin 
              ? '¿No tienes una cuenta? Regístrate' 
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 