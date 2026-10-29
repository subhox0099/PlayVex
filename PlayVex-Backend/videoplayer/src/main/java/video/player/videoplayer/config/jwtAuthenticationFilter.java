package video.player.videoplayer.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import video.player.videoplayer.Service.jwtService;

import java.io.IOException;

@Component
public class jwtAuthenticationFilter extends OncePerRequestFilter {

    private final jwtService jwtService;
    private final UserDetailsService userDetailsService;

    public jwtAuthenticationFilter(
            jwtService jwtService,
            UserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Step 1: Check whether the Bearer token exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2: Extract the actual JWT
        String token = authHeader.substring(7);

        try {

            String email = jwtService.ExtractEmail(token);


            if (SecurityContextHolder.getContext().getAuthentication() == null) {


                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);


                if (jwtService.istokenvalid(
                        token,
                        userDetails.getUsername())) {


                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );


                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}