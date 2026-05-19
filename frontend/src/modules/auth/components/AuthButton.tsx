type AuthButtonProps = {
  text: string
  onClick?: () => void
}

const AuthButton = ({
  text,
  onClick
}: AuthButtonProps) => {

  return (
    <button
      onClick={onClick}
      className="
        w-full
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-semibold
        py-4
        rounded-2xl
        transition
      "
    >
      {text}
    </button>
  )
}

export default AuthButton