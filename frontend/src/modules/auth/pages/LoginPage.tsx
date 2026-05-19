import AuthLayout from "../components/AuthLayout"
import AuthButton from "../components/AuthButton"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { loginUser } from "../api/api"

const LoginPage = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const handleLogin = async () => {

  if (!email || !password) {
    alert("Completa todos los campos")
    return
  }

  try {

    const response = await loginUser({
      email,
      password
    })

    console.log(response)

    localStorage.setItem(
      "token",
      response.accessToken
    )

    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    )

    navigate("/mapa", { replace: true })

  } catch (error: any) {

    console.error(error)

    if (error.response?.status === 401) {
      alert("Correo o contraseÃ±a incorrectos")
      return
    }

    alert("OcurriÃ³ un error al iniciar sesiÃ³n")
  }
}

  return (
    <AuthLayout>

      <div className="flex flex-col gap-6">

        {/* LOGO */}
        <div className="flex justify-center">
          <div
            className="
              w-20
              h-20
              bg-blue-500
              rounded-full
              flex
              items-center
              justify-center
              text-white
              text-3xl
              font-bold
            "
          >
            Q
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center">

          <h1 className="text-4xl font-bold text-gray-800">
            Iniciar sesiÃ³n
          </h1>

          <p className="text-gray-500 mt-2">
            Bienvenido nuevamente
          </p>

        </div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Correo electrÃ³nico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              border
              border-gray-200
              rounded-2xl
              px-4
              py-4
              text-gray-700
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          {/* PASSWORD */}
          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="ContraseÃ±a"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                border
                border-gray-200
                rounded-2xl
                px-4
                py-4
                pr-14
                text-gray-700
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            >
              {showPassword ? (
                <span aria-hidden="true">Ocultar</span>
              ) : (
                <span aria-hidden="true">Ver</span>
              )}
            </button>

          </div>

        </div>

        {/* BUTTON */}
        <AuthButton
        text="Iniciar sesiÃ³n"
        onClick={handleLogin}
        />

        {/* REGISTER */}
        <p className="text-center text-gray-500">

          Â¿No tienes cuenta?{" "}

          <Link
            to="/register"
            className="text-blue-600 font-medium"
          >
            Crear cuenta
          </Link>

        </p>

      </div>

    </AuthLayout>
  )
}

export default LoginPage
