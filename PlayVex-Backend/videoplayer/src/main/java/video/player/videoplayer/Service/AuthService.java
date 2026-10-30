package video.player.videoplayer.Service;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import video.player.videoplayer.DTO.LoginRequest;
import video.player.videoplayer.DTO.registerRequest;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Repository.userRepository;

import java.util.Map;

@Service
public class AuthService {
    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final jwtService jwtService;

    public AuthService(userRepository userRepository, PasswordEncoder passwordEncoder, jwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void Register(registerRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already taken");
        }

        user user = new user();
        user.setUsername(username);
        user.setEmail(email);
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
    }

    public Map<String, Object> login(LoginRequest request) {
        user user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return Map.of(
                "message", "login successful",
                "username", user.getUsername(),
                "email", user.getEmail(),
                "token", token,
                "userid", user.getId()
        );
    }
}
