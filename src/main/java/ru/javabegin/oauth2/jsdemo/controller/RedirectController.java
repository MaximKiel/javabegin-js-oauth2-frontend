package ru.javabegin.oauth2.jsdemo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class RedirectController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/redirect")
    public String redirect() {
        return "redirect";
    }

    @PostMapping("/result")
    public String result() {
        return "index";
    }
}