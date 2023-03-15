const ErrorModal = (props) => {
  const onClickHandler = () => {
    props.onClick();
  };

  return (
    <div
      className="flex flex-col justify-center text-center bg-red-600 text-slate-100 border-slate-800
       border rounded-xl p-4 h-16 hover:bg-red-400 transition duration-150"
      onClick={onClickHandler}>
      <div>{props.title}</div>
      <div>{props.message}</div>
    </div>
  );
};

export default ErrorModal;
