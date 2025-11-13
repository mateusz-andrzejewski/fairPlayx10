function RegisterLink() {
  return (
    <div className="text-center" data-test-id="register-link-section">
      <p className="text-sm text-gray-600">
        Nie masz jeszcze konta?{" "}
        <a 
          href="/register" 
          className="font-medium text-indigo-600 hover:text-indigo-500"
          data-test-id="register-link"
        >
          Zarejestruj się
        </a>
      </p>
    </div>
  );
}

export { RegisterLink };
