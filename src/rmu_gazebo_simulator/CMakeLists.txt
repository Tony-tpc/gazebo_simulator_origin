cmake_minimum_required(VERSION 3.5)
project(rmu_gazebo_simulator)

find_package(ament_cmake REQUIRED)

install(DIRECTORY
    config
    launch
    rviz
    resource

    DESTINATION share/${PROJECT_NAME}/
)

install(PROGRAMS
    scripts/referee_system/simple_competition_1v1.py
DESTINATION lib/${PROJECT_NAME})

# environment
ament_environment_hooks("${CMAKE_CURRENT_SOURCE_DIR}/env-hooks/gazebo.dsv.in")

ament_package()
