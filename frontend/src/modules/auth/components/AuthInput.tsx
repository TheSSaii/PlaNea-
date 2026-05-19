type AuthInputProps = {
  type: string
  placeholder: string
}

const AuthInput = ({
  type,
  placeholder
}: AuthInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
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
  )
}

export default AuthInput