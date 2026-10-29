package video.player.videoplayer.Service;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import video.player.videoplayer.DTO.*;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Repository.userRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class userService {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Directory where profile pictures will be stored on disk
    private final Path profilePictureDir = Paths.get("profile-pictures");

    public userService(userRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ─── getUserProfile ────────────────────────────────────────────────────────

    /**
     * Returns the profile details of the currently authenticated user.
     */
    public UserProfileResponse getUserProfile(String email) {
        user currentUser = findUserByEmail(email);
        return toProfileResponse(currentUser);
    }

    // ─── updateName ────────────────────────────────────────────────────────────

    /**
     * Changes the username of the currently authenticated user.
     * Throws CONFLICT if the new username is already taken.
     */
    @Transactional
    public UserProfileResponse updateName(String email, UpdateNameRequest request) {
        user currentUser = findUserByEmail(email);

        String newUsername = request.getUsername().trim();

        if (newUsername.equalsIgnoreCase(currentUser.getUsername())) {
            // No-op: same name
            return toProfileResponse(currentUser);
        }

        if (userRepository.existsByUsername(newUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }

        currentUser.setUsername(newUsername);
        userRepository.save(currentUser);
        return toProfileResponse(currentUser);
    }

    // ─── updateEmail ───────────────────────────────────────────────────────────

    /**
     * Changes the email address of the currently authenticated user.
     * Throws CONFLICT if the new email is already registered.
     */
    @Transactional
    public UserProfileResponse updateEmail(String email, UpdateEmailRequest request) {
        user currentUser = findUserByEmail(email);

        String newEmail = request.getEmail().trim().toLowerCase();

        if (newEmail.equals(currentUser.getEmail())) {
            return toProfileResponse(currentUser);
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        currentUser.setEmail(newEmail);
        userRepository.save(currentUser);
        return toProfileResponse(currentUser);
    }

    // ─── changePassword ────────────────────────────────────────────────────────

    /**
     * Securely changes the password after verifying the current one.
     */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        user currentUser = findUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "New password must be different from the current password");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    // ─── updateProfilePicture ──────────────────────────────────────────────────

    /**
     * Saves a new profile picture for the user.
     * Stores the image to disk and persists the relative path in the DB.
     */
    @Transactional
    public UserProfileResponse updateProfilePicture(String email, MultipartFile file) {
        user currentUser = findUserByEmail(email);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile picture file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        try {
            // Ensure storage directory exists
            if (!Files.exists(profilePictureDir)) {
                Files.createDirectories(profilePictureDir);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }

            String uniqueFileName = UUID.randomUUID() + extension;
            Path destination = profilePictureDir.resolve(uniqueFileName).normalize();

            if (!destination.startsWith(profilePictureDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
            }

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            // Delete old picture if it exists on disk
            if (currentUser.getProfilePicture() != null) {
                Path oldFile = Paths.get(currentUser.getProfilePicture());
                try {
                    Files.deleteIfExists(oldFile);
                } catch (IOException ignored) {
                    // Best-effort cleanup; don't fail the request
                }
            }

            currentUser.setProfilePicture(destination.toString());
            userRepository.save(currentUser);
            return toProfileResponse(currentUser);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to save profile picture");
        }
    }

    // ─── deleteAccount ────────────────────────────────────────────────────────

    /**
     * Permanently deletes the user account after verifying the password.
     * Videos are cascade-deleted via the DB foreign key relationship.
     */
    @Transactional
    public void deleteAccount(String email, String password) {
        user currentUser = findUserByEmail(email);

        if (!passwordEncoder.matches(password, currentUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Password is incorrect. Account deletion denied.");
        }

        userRepository.delete(currentUser);
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private user findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserProfileResponse toProfileResponse(user u) {
        return new UserProfileResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRole(),
                u.getProfilePicture(),
                u.getVideos() != null ? u.getVideos().size() : 0
        );
    }
}
