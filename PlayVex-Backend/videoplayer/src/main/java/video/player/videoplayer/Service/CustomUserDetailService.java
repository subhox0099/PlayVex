package video.player.videoplayer.Service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Repository.userRepository;

@Service
public class CustomUserDetailService implements UserDetailsService {

    private final userRepository userRepository;

    public CustomUserDetailService(
                                   userRepository userRepository) {

        this.userRepository = userRepository;
    }




    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
user user = userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException("user not found"));


return org.springframework.security.core.userdetails.User
        .withUsername(user.getEmail())
        .password(user.getPassword())
        .authorities("role_"+ user.getRole())
        .build();

    }
}
