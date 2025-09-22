package com.bellingham.datafutures.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bellingham.datafutures.config.JwtProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = resolveTokenFromCookies(request.getCookies());
        String username = null;

        if (token == null && header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    username = jwtUtil.extractUsername(token);
                } else {
                    logger.warn("Token validation failed for request URI: {}", request.getRequestURI());
                }
            } catch (Exception e) {
                logger.error("Error parsing JWT for request URI: {}", request.getRequestURI(), e);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final JwtProperties jwtProperties;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService, JwtProperties jwtProperties) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.jwtProperties = jwtProperties;
    }

    private String resolveTokenFromCookies(Cookie[] cookies) {
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (jwtProperties.getCookie().getName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}

