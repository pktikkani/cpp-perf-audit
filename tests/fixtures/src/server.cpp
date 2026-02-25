#include "server.hpp"
#include <iostream>

void Server::start() {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_running = true;

    for (int i = 0; i < 4; i++) {
        m_workers.emplace_back([this]() {
            while (m_running) {  // Potential data race: reading m_running without lock
                // do work
            }
        });
    }
}

void Server::stop() {
    m_running = false;  // Potential data race: writing m_running without lock
    for (auto& t : m_workers) {
        if (t.joinable()) {
            t.join();
        }
    }
}
