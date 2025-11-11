function RegisterLink() {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        Nie masz jeszcze konta?{" "}
        <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Zarejestruj się
        </a>
      </p>
    </div>
  );
}

export { RegisterLink };
