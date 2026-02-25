#pragma once

#include <string>
#include <mutex>
#include <thread>
#include <vector>

class Server {
public:
    Server() = default;
    virtual ~Server() = default;

    void start();
    void stop();

private:
    std::mutex m_mutex;
    std::vector<std::thread> m_workers;
    bool m_running = false;
};
