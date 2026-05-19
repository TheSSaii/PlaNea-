import AuthLayout from "../components/AuthLayout"
import AuthButton from "../components/AuthButton"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { registerUser } from "../api/api"

const RegisterPage = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleRegister = async () => {

    if (!name || !email || !password || !confirmPassword) {
      alert("Completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      alert("Las contraseÃ±as no coinciden")
      return
    }

    try {

      const response = await registerUser({
        name,
        email,
        password
      })

      localStorage.setItem("token", response.accessToken)
      localStorage.setItem("user", JSON.stringify(response.user))
      navigate("/mapa", { replace: true })

    } catch (error: any) {

      console.error(error)

      if (error.response?.status === 409) {
        alert("Este correo ya estÃ¡ registrado")
        return
      }

      alert("Error al registrar usuario")
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
            Crear cuenta
          </h1>

          <p className="text-gray-500 mt-2">
            RegÃ­strate para continuar
          </p>

        </div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <input
            type="password"
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
              text-gray-700
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <input
            type="password"
            placeholder="Confirmar contraseÃ±a"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        </div>

        {/* BUTTON */}
        <AuthButton
          text="Registrarse"
          onClick={handleRegister}
        />

        {/* LOGIN */}
        <p className="text-center text-gray-500">

          Â¿Ya tienes cuenta?{" "}

          <Link
            to="/login"
            className="text-blue-600 font-medium"
          >
            Inicia sesiÃ³n
          </Link>

        </p>

      </div>

    </AuthLayout>
  )
}

export default RegisterPage
