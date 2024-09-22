library(tidyverse)
library(giscoR)

world_shape<-st_read("/Users/knith/Mirror/05_Website/kosalnith.github.io/static/img/travelMap/ne_10m_admin_0_countries/ne_10m_admin_0_countries.shp")

## Important
world_shape %>%
  st_transform(crs=3857) %>% 
  ggplot(aes(geometry = geometry)) +
  geom_sf()+
  coord_sf(ylim = c(-7000000,NA))


world_shape %>%
  st_transform(crs=3857) %>% 
  ggplot(aes(geometry = geometry)) +
  geom_sf(
    data = world_shape,
    aes(fill = NAME),
    color = 'black',
    linewidth = 0.5
  ) +
  geom_sf()+
  coord_sf(ylim = c(-7000000,NA))

  
  

## We don’t actually see the colors
world_shape %>%
  st_transform(crs=3857) %>%  
  ggplot(aes(geometry = geometry)) +
  geom_sf(
    data = world_shape,
    aes(fill = NAME),
    color = 'black',
    linewidth = 0.5
  ) +
  geom_sf(
    fill = NA,
    color = 'black',
    linewidth = 0.1
  )+
  coord_sf(ylim = c(-7000000,NA))

  
library(ggiraph)
gg_plt <- world_shape %>%
  st_transform(crs=3857) %>%  
  ggplot(aes(geometry = geometry)) +
  geom_sf(
    data = world_shape,
    aes(fill = NAME),
    color = 'black',
    linewidth = 0.5
  )+
  coord_sf(ylim = c(-7000000,NA))+
  geom_sf_interactive(
    fill = NA, 
    aes(
      data_id = ISO_A3,
      tooltip = glue::glue('{NAME}')
    ),
    linewidth = 0.1
  )

girafe(ggobj = gg_plt)
  
  
  
## Let’s get rid of the unnecessary legend and grid first though
library(ggiraph)
gg_plt <- world_shape %>%
  st_transform(crs=3857) %>%  
  ggplot(aes(geometry = geometry)) +
  geom_sf(
    data = world_shape,
    aes(fill = NAME),
    color = 'black',
    linewidth = 0.07
  ) +
  geom_sf_interactive(
    fill = NA, 
    aes(
      data_id = ISO_A3,
      tooltip = glue::glue('{NAME}')
    ),
    linewidth = 0.1
  ) +
  theme_void() +
  theme(
    legend.position = 'none'
  )+
  coord_sf(ylim = c(-7000000,NA))

girafe(ggobj = gg_plt)







# Install and load necessary libraries
install.packages("ggplot2")
install.packages("rnaturalearth")
install.packages("rnaturalearthdata")
install.packages("sf")
install.packages("dplyr")  # For data manipulation

library(ggplot2)
library(rnaturalearth)
library(rnaturalearthdata)
library(sf)
library(dplyr)




# Install and load necessary libraries
install.packages("ggplot2")
install.packages("rnaturalearth")
install.packages("rnaturalearthdata")
install.packages("sf")
install.packages("dplyr")  # For data manipulation

library(ggplot2)
library(rnaturalearth)
library(rnaturalearthdata)
library(sf)
library(dplyr)

# Load Natural Earth world data (land only)
world <- ne_countries(scale = "medium", returnclass = "sf")

# Create a dataset with country names and the 'x' variable (1 = red, 0 = off-white)
data <- data.frame(
  name = c("Denmark", "Austria", "Switzerland", "Spain", "China", "United Kingdom", "France", "Germany", "Cambodia", "Thailand", "Vietnam", "Malaysia", "Indonesia", "Laos"),
  x = c(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1)  # Example: 1 for red, 0 for off-white
)

# Merge the dataset with the world spatial data using the country name
world_data <- world %>% 
  left_join(data, by = c("name" = "name"))

# For countries not in the data, set 'x' to NA and treat them as 0 (off-white)
world_data$x[is.na(world_data$x)] <- 0

# Create the map with enhanced colors: red for 'x = 1', pastel color for 'x = 0'
map <- ggplot(data = world_data) +
  geom_sf(aes(fill = factor(x)), color = "gray30", size = 0.0) +  # Map 'x' to fill color
  scale_fill_manual(values = c("0" = "#DFE0D5", "1" = "#DE4D04")) +  # Define great colors: off-white and vibrant red
  theme(
    panel.background = element_rect(fill = "#FFFFFF", color = NA),  # Soft light blue background for the ocean
    panel.grid.major = element_blank(),
    panel.grid.minor = element_blank(),
    axis.text = element_blank(),
    axis.ticks = element_blank(),
    legend.position = "none",  # Hide legend for a clean look
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "gray30"),  # Stylish title
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray20")  # Subtitle with complementary color
  )+
  geom_sf_interactive(
    fill = NA, 
    aes(tooltip = glue::glue('{name}'))
  )+
  labs(title = "My Travel Stamp Collection",
       subtitle = "This map shows the countries I’ve visited for both work and vacations. Some I’ve been to once, others twice, and a few I’ve returned to many times.") +
  coord_sf(crs = "+proj=merc", ylim = c(-8000000,NA), expand = FALSE) # Mercator projection with limited latitude

girafe(ggobj = map)


