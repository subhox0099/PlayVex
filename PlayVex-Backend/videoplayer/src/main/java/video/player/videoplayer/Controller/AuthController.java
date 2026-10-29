package video.player.videoplayer.Controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import video.player.videoplayer.DTO.LoginRequest;
import video.player.videoplayer.DTO.registerRequest;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
     public AuthController(AuthService authService) {
         this.authService = authService;
     }

     @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody registerRequest registerRequest){
         authService.Register(registerRequest);
         return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "user registered successfully"));
     }

     @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request){
         Map<String, Object> response = authService.login(request);
         return ResponseEntity.ok(response);
     }
}
