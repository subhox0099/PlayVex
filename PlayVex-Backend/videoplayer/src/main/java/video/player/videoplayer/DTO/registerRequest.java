package video.player.videoplayer.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.NonNull;
import org.aspectj.bridge.IMessage;
import jakarta.validation.constraints.NotBlank;
public class registerRequest {
@NotBlank(message = "please enter a valid username")
@Size(min = 3, max = 50, message = "username must be 3 - 50  characters")
private String username;
@NotBlank(message = "please enter your password")
@Size(min = 6, max = 100, message = "password must be 6-8 characters long")
private String password;
    @Email(message = "enter a valid email")
    @NotBlank(message = "please enter your email address")
    @Size(max = 150)
private String email;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
