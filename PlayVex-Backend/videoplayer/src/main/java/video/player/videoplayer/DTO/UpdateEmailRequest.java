package video.player.videoplayer.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateEmailRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String email;

    public UpdateEmailRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
