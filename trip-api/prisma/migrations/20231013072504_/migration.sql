-- CreateIndex
CREATE INDEX "location_trip_start" ON "Trip" USING GIST ("startCoords");

-- CreateIndex
CREATE INDEX "location_trip_to" ON "Trip" USING GIST ("toCoords");
