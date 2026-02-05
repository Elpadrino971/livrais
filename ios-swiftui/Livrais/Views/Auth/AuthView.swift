import SwiftUI

struct AuthView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var isSignUp = false
    @State private var email = ""
    @State private var password = ""
    @State private var fullName = ""
    @State private var phoneNumber = ""
    @State private var showPassword = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color("Primary"), Color("Primary").opacity(0.7)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 30) {
                        // Logo and Title
                        VStack(spacing: 16) {
                            Text("📦")
                                .font(.system(size: 80))

                            Text("Livrais")
                                .font(.system(size: 40, weight: .bold))
                                .foregroundColor(.white)

                            Text("Livraison collaborative en Guyane")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 60)

                        // Form Card
                        VStack(spacing: 20) {
                            // Toggle Sign In / Sign Up
                            Picker("Mode", selection: $isSignUp) {
                                Text("Connexion").tag(false)
                                Text("Inscription").tag(true)
                            }
                            .pickerStyle(.segmented)
                            .padding(.bottom, 10)

                            // Name Field (Sign Up only)
                            if isSignUp {
                                TextField("Nom complet", text: $fullName)
                                    .textContentType(.name)
                                    .textInputAutocapitalization(.words)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(10)
                            }

                            // Email Field
                            TextField("Email", text: $email)
                                .textContentType(.emailAddress)
                                .textInputAutocapitalization(.never)
                                .keyboardType(.emailAddress)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(10)

                            // Phone Field (Sign Up only)
                            if isSignUp {
                                TextField("Téléphone (optionnel)", text: $phoneNumber)
                                    .textContentType(.telephoneNumber)
                                    .keyboardType(.phonePad)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(10)
                            }

                            // Password Field
                            HStack {
                                if showPassword {
                                    TextField("Mot de passe", text: $password)
                                        .textContentType(isSignUp ? .newPassword : .password)
                                } else {
                                    SecureField("Mot de passe", text: $password)
                                        .textContentType(isSignUp ? .newPassword : .password)
                                }

                                Button {
                                    showPassword.toggle()
                                } label: {
                                    Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                                        .foregroundColor(.gray)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(10)

                            // Error Message
                            if let error = authViewModel.error {
                                Text(error.localizedDescription)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .multilineTextAlignment(.center)
                            }

                            // Submit Button
                            Button {
                                Task {
                                    if isSignUp {
                                        await authViewModel.signUp(
                                            email: email,
                                            password: password,
                                            fullName: fullName,
                                            phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber
                                        )
                                    } else {
                                        await authViewModel.signIn(email: email, password: password)
                                    }
                                }
                            } label: {
                                if authViewModel.isLoading {
                                    ProgressView()
                                        .progressViewStyle(.circular)
                                        .tint(.white)
                                } else {
                                    Text(isSignUp ? "S'inscrire" : "Se connecter")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color("Primary"))
                            .cornerRadius(10)
                            .disabled(authViewModel.isLoading || !isFormValid)
                            .opacity(isFormValid ? 1.0 : 0.6)
                        }
                        .padding(24)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(radius: 10)
                        .padding(.horizontal)

                        Spacer()
                    }
                }
            }
        }
    }

    private var isFormValid: Bool {
        if isSignUp {
            return !email.isEmpty && !password.isEmpty && !fullName.isEmpty && password.count >= 6
        } else {
            return !email.isEmpty && !password.isEmpty
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthViewModel())
}
