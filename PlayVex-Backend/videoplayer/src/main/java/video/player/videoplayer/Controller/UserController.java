package video.player.videoplayer.Controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import video.player.videoplayer.DTO.*;
import video.player.videoplayer.Service.userService;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final userService userService;

    public UserController(userService userService) {
        this.userService = userService;
    }

    // ─── GET /api/users/profile ───────────────────────────────────────────────

    /**
     * Returns the profile details of the currently authenticated user.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserProfileResponse profile = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    // ─── PATCH /api/users/update-name ─────────────────────────────────────────

    /**
     * Changes the username of the currently authenticated user.
     */
    @PatchMapping("/update-name")
    public ResponseEntity<UserProfileResponse> updateName(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateNameRequest request) {

        UserProfileResponse updated = userService.updateName(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    // ─── PATCH /api/users/update-email ────────────────────────────────────────

    /**
     * Changes the email address of the currently authenticated user.
     */
    @PatchMapping("/update-email")
    public ResponseEntity<UserProfileResponse> updateEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateEmailRequest request) {

        UserProfileResponse updated = userService.updateEmail(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    // ─── PATCH /api/users/change-password ────────────────────────────────────

    /**
     * Securely changes the password. Requires current password for verification.
     */
    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ─── PATCH /api/users/update-profile-picture ─────────────────────────────

    /**
     * Uploads and sets a new profile picture for the currently authenticated user.
     */
    @PatchMapping(value = "/update-profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<UserProfileResponse> updateProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        UserProfileResponse updated = userService.updateProfilePicture(userDetails.getUsername(), file);
        return ResponseEntity.ok(updated);
    }

    // ─── DELETE /api/users/delete-account ────────────────────────────────────

    /**
     * Permanently deletes the authenticated user's account.
     * Requires password confirmation in the request body.
     */
    @DeleteMapping("/delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password is required to delete account"));
        }

        userService.deleteAccount(userDetails.getUsername(), password);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
