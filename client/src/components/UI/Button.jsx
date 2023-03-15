const Button = ({ label, onClick }) => {
  return (
    <button
      className="bg-cyan-800 text-slate-100 hover:bg-cyan-700 h-10 px-4 rounded-lg border border-cyan-900 duration-200"
      onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
