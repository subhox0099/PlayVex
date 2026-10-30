package video.player.videoplayer.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final jwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            jwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        // Allow all preflight CORS OPTIONS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/health",
                                "/error"
                        ).permitAll()

                        // Public video browsing & streaming
                        .requestMatchers(HttpMethod.GET, "/api/videos/allvideos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/{id}/play").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/videos/{id}/view").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/video/**").permitAll()

                        // Authenticated video actions
                        .requestMatchers(HttpMethod.POST, "/api/videos/upload").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/videos/my-videos").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/videos/{id}/like").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/videos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/videos/**").authenticated()

                        // Authenticated user and comment actions
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allows frontend origins in local development and production deployments (e.g. Vercel, Render)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource()));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
